import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { Student } from '@/app/types';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Student[]) => void;
}

export function ImportDataModal({ isOpen, onClose, onImport }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx' && fileType !== 'xls') {
      setError('Format file tidak didukung. Harap upload file CSV, XLS, atau XLSX.');
      setFile(null);
      setPreviewData([]);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');

    // Read and parse file
    const reader = new FileReader();
    
    if (fileType === 'csv') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(selectedFile);
    } else {
      // For Excel files (.xlsx, .xls)
      reader.onload = (event) => {
        const data = event.target?.result;
        parseExcel(data);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        setError('File CSV kosong atau tidak valid.');
        setPreviewData([]);
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/["\r]/g, ''));
      
      // Validate required columns
      const requiredColumns = ['nama', 'kelas', 'nis', 'nisn', 'alamat', 'status', 'tahunAjaran'];
      const missingColumns = requiredColumns.filter(col => !headers.some(h => h.toLowerCase() === col.toLowerCase()));
      
      if (missingColumns.length > 0) {
        setError(`Kolom yang wajib ada namun tidak ditemukan: ${missingColumns.join(', ')}`);
        setPreviewData([]);
        return;
      }

      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/["\r]/g, ''));
        if (values.length !== headers.length) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }

      setPreviewData(data);
      setSuccess(`Berhasil membaca ${data.length} baris data.`);
    } catch (err) {
      setError('Gagal membaca file CSV. Pastikan format file sudah benar.');
      setPreviewData([]);
    }
  };

  const parseExcel = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dataJson: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (dataJson.length === 0) {
        setError('File Excel kosong atau tidak valid.');
        setPreviewData([]);
        return;
      }

      // Map column names (support both Indonesian and English)
      const columnMapping: { [key: string]: string } = {
        'Nama Lengkap': 'nama',
        'nama lengkap': 'nama',
        'Nama': 'nama',
        'nama': 'nama',
        
        'Kelas': 'kelas',
        'kelas': 'kelas',
        
        'NIS': 'nis',
        'nis': 'nis',
        
        'NISN': 'nisn',
        'nisn': 'nisn',
        
        'Alamat Lengkap': 'alamat',
        'alamat lengkap': 'alamat',
        'Alamat': 'alamat',
        'alamat': 'alamat',
        
        'Nama Orang Tua/Wali': 'namaOrangTua',
        'nama orang tua/wali': 'namaOrangTua',
        'Nama Orang Tua': 'namaOrangTua',
        'nama orang tua': 'namaOrangTua',
        'namaOrangTua': 'namaOrangTua',
        
        'Status (Mukim/Non Mukim)': 'status',
        'status (mukim/non mukim)': 'status',
        'Status': 'status',
        'status': 'status',
        
        'Tahun Ajaran': 'tahunAjaran',
        'tahun ajaran': 'tahunAjaran',
        'tahunAjaran': 'tahunAjaran',
        
        'Total Biaya': 'totalBiaya',
        'total biaya': 'totalBiaya',
        'totalBiaya': 'totalBiaya',
        'TotalBiaya': 'totalBiaya',
        
        'Sudah Terbayar': 'terbayar',
        'sudah terbayar': 'terbayar',
        'Terbayar': 'terbayar',
        'terbayar': 'terbayar',
      };

      // Parse data rows and normalize column names
      const parsedData = dataJson.map(row => {
        const normalizedRow: any = {};
        
        Object.keys(row).forEach(key => {
          const normalizedKey = columnMapping[key] || key.toLowerCase();
          normalizedRow[normalizedKey] = row[key];
        });
        
        return normalizedRow;
      }).filter(row => row.nama); // Only include rows with nama

      // Validate required columns
      if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        const requiredFields = ['nama', 'kelas', 'nis', 'nisn', 'alamat', 'status', 'tahunAjaran'];
        const missingFields = requiredFields.filter(field => !firstRow[field]);
        
        if (missingFields.length > 0) {
          setError(`Kolom yang wajib ada namun tidak ditemukan: ${missingFields.join(', ')}`);
          setPreviewData([]);
          return;
        }
      }

      setPreviewData(parsedData);
      setSuccess(`Berhasil membaca ${parsedData.length} baris data.`);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setError('Gagal membaca file Excel. Pastikan format file sudah benar dan menggunakan template yang disediakan.');
      setPreviewData([]);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      setError('Tidak ada data untuk diimport.');
      return;
    }

    try {
      // Import hanya data siswa, tanpa rincian biaya
      const newStudents: Student[] = previewData.map((row, index) => {
        return {
          id: `STD-${Date.now()}-${index}`,
          nama: row.nama || row.Nama || '',
          kelas: row.kelas || row.Kelas || '',
          nis: row.nis || row.NIS || '',
          nisn: row.nisn || row.NISN || '',
          alamat: row.alamat || row.Alamat || '',
          namaOrangTua: row.namaOrangTua || row.NamaOrangTua || row.nama_orang_tua || '',
          status: (row.status || row.Status || 'Non Mukim') as 'Mukim' | 'Non Mukim',
          tahunAjaran: row.tahunAjaran || row.TahunAjaran || row.tahun_ajaran || '',
          totalBiaya: 0, // Akan dihitung dari rincian biaya
          terbayar: 0,   // Akan dihitung dari rincian biaya
          tunggakan: 0,  // Akan dihitung dari rincian biaya
          rincianBiaya: [] // Kosong, akan dikelola manual
        };
      });

      onImport(newStudents);
      toast.success(`Berhasil mengimport ${newStudents.length} data siswa! Silakan kelola rincian biaya di menu Data Siswa.`);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Gagal mengimport data. Pastikan format data sudah benar.');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Define columns with Indonesian headers (HANYA DATA SISWA, TANPA RINCIAN BIAYA)
    const headers = [
      'Nama Lengkap',
      'Kelas',
      'NIS',
      'NISN',
      'Alamat Lengkap',
      'Nama Orang Tua/Wali',
      'Status (Mukim/Non Mukim)',
      'Tahun Ajaran'
    ];
    
    // Sample data for guidance
    const sampleData = [
      [
        'Ahmad Fauzi',
        'X RPL 1',
        '2024001',
        '0012345678',
        'Jl. Merdeka No. 10, Cisauk',
        'Bapak Ahmad Fauzi',
        'Mukim',
        '2024/2025'
      ],
      [
        'Siti Nurhaliza',
        'X TKJ 1',
        '2024002',
        '0012345679',
        'Jl. Pahlawan No. 15, Tangerang',
        'Ibu Haliza Sari',
        'Non Mukim',
        '2024/2025'
      ],
      [
        'Budi Santoso',
        'XI RPL 1',
        '2023001',
        '0012345680',
        'Jl. Sudirman No. 20, Cisauk',
        'Bapak Santoso Wijaya',
        'Mukim',
        '2024/2025'
      ]
    ];
    
    // Combine headers and sample data
    const wsData = [headers, ...sampleData];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Nama Lengkap
      { wch: 12 }, // Kelas
      { wch: 12 }, // NIS
      { wch: 15 }, // NISN
      { wch: 35 }, // Alamat
      { wch: 25 }, // Nama Orang Tua
      { wch: 25 }, // Status
      { wch: 15 }  // Tahun Ajaran
    ];
    
    // Style header row (make it bold and colored)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Apply style to header
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = headerStyle;
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    
    // Create instructions sheet
    const instructionsData = [
      ['PETUNJUK PENGISIAN TEMPLATE IMPORT DATA SISWA'],
      [''],
      ['1. FORMAT KOLOM:', ''],
      ['   - Nama Lengkap', 'Isi dengan nama lengkap siswa'],
      ['   - Kelas', 'Contoh: X RPL 1, XI TKJ 2, XII RPL 1'],
      ['   - NIS', 'Nomor Induk Siswa (angka)'],
      ['   - NISN', 'Nomor Induk Siswa Nasional (10 digit)'],
      ['   - Alamat Lengkap', 'Alamat tempat tinggal siswa'],
      ['   - Nama Orang Tua/Wali', 'Nama lengkap orang tua atau wali'],
      ['   - Status', 'Pilih: "Mukim" atau "Non Mukim" (tanpa tanda kutip)'],
      ['   - Tahun Ajaran', 'Format: 2024/2025'],
      [''],
      ['2. PENTING:', ''],
      ['   ✓ Jangan mengubah nama kolom di baris pertama'],
      ['   ✓ Hapus baris contoh sebelum mengisi data asli'],
      ['   ✓ Pastikan semua kolom terisi dengan benar'],
      ['   ✓ Status harus tepat: "Mukim" atau "Non Mukim"'],
      ['   ✓ Simpan file dalam format .xlsx atau .xls'],
      ['   ✓ Rincian biaya akan dikelola manual di sistem setelah import'],
      [''],
      ['3. TENTANG RINCIAN BIAYA:', ''],
      ['   ℹ️ Rincian biaya TIDAK diimport dari file Excel'],
      ['   ℹ️ Setelah import siswa, gunakan fitur "Kelola Rincian Biaya"'],
      ['   ℹ️ Admin dapat menambah/edit/hapus rincian biaya per siswa'],
      ['   ℹ️ Sistem akan otomatis menghitung total dari rincian biaya'],
      [''],
      ['4. CONTOH DATA:', ''],
      ['   Lihat sheet "Data Siswa" untuk contoh pengisian'],
      [''],
      ['5. CARA IMPORT:', ''],
      ['   1. Isi data siswa di sheet "Data Siswa"'],
      ['   2. Hapus baris contoh (baris 2-4)'],
      ['   3. Simpan file'],
      ['   4. Upload file di sistem'],
      ['   5. Preview data akan muncul'],
      ['   6. Klik "Import" untuk menyimpan data'],
      ['   7. Kelola rincian biaya di menu Data Siswa'],
    ];
    
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 30 }, { wch: 60 }];
    
    // Style title
    if (wsInstructions['A1']) {
      wsInstructions['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E75B5" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'PETUNJUK');
    
    // Generate Excel file
    XLSX.writeFile(wb, 'Template_Import_Siswa_SMK_AL-ISHLAH.xlsx');
    
    toast.success('Template Excel berhasil didownload!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data Siswa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert className="bg-blue-50 border-blue-200">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <p className="font-semibold mb-2 text-blue-900">Petunjuk Import Data:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Klik tombol "Download Template Excel" di bawah ini</li>
                <li>Buka file Excel yang telah didownload</li>
                <li>Baca petunjuk di sheet "PETUNJUK"</li>
                <li>Isi data siswa di sheet "Data Siswa" sesuai kolom yang tersedia</li>
                <li>Hapus baris contoh sebelum mengisi data asli</li>
                <li>Simpan file Excel (.xlsx)</li>
                <li>Upload file yang sudah diisi ke sistem</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Download Template Button */}
          <div className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-800 mb-2">📥 Download Template Excel</h3>
              <p className="text-sm text-gray-600 mb-4">
                Template sudah dilengkapi dengan petunjuk lengkap dan contoh data
              </p>
            </div>
            <Button 
              onClick={downloadTemplate} 
              className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base h-auto"
            >
              <Download className="h-5 w-5" />
              Download Template Excel
            </Button>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>✓ Format .xlsx</span>
              <span>•</span>
              <span>✓ 10 Kolom</span>
              <span>•</span>
              <span>✓ Dengan Petunjuk</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {file ? file.name : 'Klik untuk upload file Excel (.xlsx)'}
              </p>
              <p className="text-sm text-gray-500">
                atau drag and drop file Excel di sini
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Format yang didukung: .xlsx, .xls, .csv
              </p>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Preview Data ({previewData.length} baris):</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Biaya</TableHead>
                        <TableHead>Terbayar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.nama || row.Nama}</TableCell>
                          <TableCell>{row.kelas || row.Kelas}</TableCell>
                          <TableCell>{row.nis || row.NIS}</TableCell>
                          <TableCell>{row.nisn || row.NISN}</TableCell>
                          <TableCell>{row.status || row.Status}</TableCell>
                          <TableCell>{row.totalBiaya || row.TotalBiaya}</TableCell>
                          <TableCell>{row.terbayar || row.Terbayar || '0'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {previewData.length > 10 && (
                  <div className="p-2 bg-gray-50 text-center text-sm text-gray-600">
                    Menampilkan 10 dari {previewData.length} baris data
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleImport} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={previewData.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import {previewData.length > 0 ? `${previewData.length} Data` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
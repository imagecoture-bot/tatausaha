export interface User {
  username: string;
  password: string;
  nama: string;
  role: 'admin';
}

export interface BiayaItem {
  id: string;
  namaBiaya: string;
  jumlah: number;
  terbayar: number;
  tunggakan: number;
  status: 'Lunas' | 'Belum Lunas';
}

export interface Student {
  id: string;
  nama: string;
  kelas: string;
  nis: string;
  nisn: string;
  alamat: string;
  namaOrangTua: string;
  status: 'Mukim' | 'Non Mukim';
  tahunAjaran: string;
  totalBiaya: number;
  terbayar: number;
  tunggakan: number;
  rincianBiaya: BiayaItem[];
}

export interface BiayaAdministrasi {
  id: string;
  nama: string;
  jumlah: number;
  keterangan: string;
}

export interface Transaction {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  jumlah: number;
  tanggal: string;
  waktu: string;
  jenisPembayaran: string;
  keterangan: string;
  status: 'success' | 'pending' | 'failed';
}

export interface Payment {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  jumlahBayar: number;
  metodePembayaran: 'BCA' | 'BRI' | 'DANA';
  nomorRekening?: string;
  tanggalPembayaran: string;
  waktuPembayaran: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  buktiTransfer?: string;
  nomorKwitansi: string;
  namaOrangTua?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  biayaItemIds?: string[]; // IDs of BiayaItem that this payment is for
}

export interface SPPBulanan {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  status: 'Mukim' | 'Non Mukim';
  bulan: string; // Format: YYYY-MM (e.g., 2024-01)
  tahunAjaran: string;
  jumlahSPP: number;
  terbayar: number;
  tunggakan: number;
  statusPembayaran: 'Lunas' | 'Belum Lunas' | 'Sebagian';
  tanggalBayar?: string;
  keterangan?: string;
}

// New: Individual SPP Payment Entry (like BiayaItem for Rincian Biaya)
export interface PembayaranSPP {
  id: string;
  bulan: string; // Format: "01" to "12"
  namaBulan: string; // "Januari", "Februari", etc.
  tahun: string; // "2024", "2025", etc.
  nominal: number;
  tanggalBayar: string;
  keterangan: string;
  status: 'Lunas' | 'Belum Lunas';
}

// Extended Student with SPP payments array
export interface StudentWithSPP extends Student {
  pembayaranSPP: PembayaranSPP[];
  totalSPPTerbayar: number;
  totalSPPTunggakan: number;
}
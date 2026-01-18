import { useRef } from 'react';
import { X, Printer, Download, GraduationCap, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import type { Payment, Student } from '@/app/types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  student: Student;
}

export function ReceiptModal({ isOpen, onClose, payment, student }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Kwitansi Pembayaran - ${payment.nomorKwitansi}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt {
              border: 2px solid #000;
              padding: 30px;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .school-name {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .receipt-title {
              font-size: 20px;
              font-weight: bold;
              margin-top: 15px;
            }
            .receipt-number {
              font-size: 14px;
              margin-top: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 8px 0;
            }
            .info-label {
              font-weight: 600;
              width: 200px;
            }
            .info-value {
              flex: 1;
            }
            .amount-section {
              background: #f0f0f0;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              text-align: center;
            }
            .amount-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .amount-value {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            .amount-text {
              font-style: italic;
              margin-top: 10px;
              color: #666;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 80px;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
              font-size: 12px;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              background: #10b981;
              color: white;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const terbilang = (angka: number): string => {
    const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    
    if (angka < 12) return bilangan[angka];
    if (angka < 20) return bilangan[angka - 10] + ' belas';
    if (angka < 100) return bilangan[Math.floor(angka / 10)] + ' puluh ' + bilangan[angka % 10];
    if (angka < 200) return 'seratus ' + terbilang(angka - 100);
    if (angka < 1000) return bilangan[Math.floor(angka / 100)] + ' ratus ' + terbilang(angka % 100);
    if (angka < 2000) return 'seribu ' + terbilang(angka - 1000);
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' ribu ' + terbilang(angka % 1000);
    if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' juta ' + terbilang(angka % 1000000);
    
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Kwitansi Pembayaran
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white">
          <div className="border-2 border-gray-800 p-8">
            {/* Header */}
            <div className="text-center border-b-4 border-double border-gray-800 pb-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <GraduationCap className="h-10 w-10 text-blue-600" />
              </div>
              <div className="text-2xl font-bold mb-1">SMK AL-ISHLAH CISAUK</div>
              <div className="text-sm text-gray-600 mb-1">Jl. Raya Cisauk, Tangerang Selatan, Banten</div>
              <div className="text-sm text-gray-600">Telp: (021) 1234-5678 | Email: info@smkalishlah.sch.id</div>
              <div className="text-xl font-bold mt-4">KWITANSI PEMBAYARAN</div>
              <div className="text-sm mt-2">
                No: <span className="font-mono font-semibold">{payment.nomorKwitansi}</span>
              </div>
              <div className="mt-2">
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {payment.status === 'Verified' ? 'LUNAS' : payment.status}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 mb-6">
              <div className="flex">
                <div className="w-48 font-semibold">Sudah terima dari</div>
                <div className="flex-1">: {payment.namaOrangTua || '-'}</div>
              </div>
              <div className="flex">
                <div className="w-48 font-semibold">Nama Siswa</div>
                <div className="flex-1">: {payment.namaSiswa}</div>
              </div>
              <div className="flex">
                <div className="w-48 font-semibold">NIS</div>
                <div className="flex-1">: {payment.nis}</div>
              </div>
              <div className="flex">
                <div className="w-48 font-semibold">Kelas</div>
                <div className="flex-1">: {payment.kelas}</div>
              </div>
              <div className="flex">
                <div className="w-48 font-semibold">Tanggal Pembayaran</div>
                <div className="flex-1">: {formatDate(payment.tanggalPembayaran)} - {formatTime(payment.waktuPembayaran)} WIB</div>
              </div>
              <div className="flex">
                <div className="w-48 font-semibold">Metode Pembayaran</div>
                <div className="flex-1">: Transfer {payment.metodePembayaran}</div>
              </div>
            </div>

            {/* Amount Section */}
            <div className="bg-gray-100 p-6 rounded-lg mb-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Jumlah Pembayaran</div>
              <div className="text-4xl font-bold text-blue-600 mb-3">
                {formatCurrency(payment.jumlahBayar)}
              </div>
              <div className="text-sm italic text-gray-700">
                Terbilang: <span className="font-semibold capitalize">{terbilang(payment.jumlahBayar)} rupiah</span>
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <div className="font-semibold mb-2">Untuk Pembayaran:</div>
              <div className="pl-4">Biaya Sekolah / Administrasi Pendidikan</div>
            </div>

            {/* Remaining Balance */}
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Total Biaya</div>
                  <div className="font-semibold">{formatCurrency(student.totalBiaya)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Terbayar</div>
                  <div className="font-semibold text-green-600">{formatCurrency(student.terbayar + payment.jumlahBayar)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Sisa Tunggakan</div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(Math.max(0, student.tunggakan - payment.jumlahBayar))}
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-16">
              <div className="text-center w-48">
                <div className="mb-1">Yang Menerima,</div>
                <div className="h-20"></div>
                <div className="border-t-2 border-gray-800 pt-2 font-semibold">
                  Bagian Tata Usaha
                </div>
              </div>
              <div className="text-center w-48">
                <div className="mb-1">Yang Menyerahkan,</div>
                <div className="h-20"></div>
                <div className="border-t-2 border-gray-800 pt-2 font-semibold">
                  {payment.namaOrangTua || 'Orang Tua/Wali'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t-2 border-gray-800">
              <div className="text-xs text-gray-600">
                Kwitansi ini sah dan dicetak dari sistem administrasi SMK AL-ISHLAH CISAUK
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Cetak Kwitansi
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
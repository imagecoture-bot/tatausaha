import { useState } from 'react';
import { X, CreditCard, Smartphone, MessageCircle, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import type { Student, Payment } from '@/app/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onPaymentSubmit: (payment: Payment) => void;
}

export function PaymentModal({ isOpen, onClose, student, onPaymentSubmit }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'BCA' | 'BRI' | 'DANA'>('BCA');
  const [jumlahBayar, setJumlahBayar] = useState(student.tunggakan.toString());
  const [namaOrangTua, setNamaOrangTua] = useState(student.namaOrangTua || '');
  const [copiedAccount, setCopiedAccount] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const paymentInfo = {
    BCA: {
      name: 'Bank BCA',
      accountNumber: '1234567890',
      accountName: 'SMK AL-ISHLAH CISAUK',
      icon: <CreditCard className="h-5 w-5" />
    },
    BRI: {
      name: 'Bank BRI',
      accountNumber: '0987654321',
      accountName: 'SMK AL-ISHLAH CISAUK',
      icon: <CreditCard className="h-5 w-5" />
    },
    DANA: {
      name: 'DANA',
      accountNumber: '081234567890',
      accountName: 'SMK AL-ISHLAH CISAUK',
      icon: <Smartphone className="h-5 w-5" />
    }
  };

  const whatsappNumber = '6281234567890';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(''), 2000);
  };

  const generateNomorKwitansi = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `KWT/${year}${month}${day}/${random}`;
  };

  const handleSubmit = () => {
    const now = new Date();
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      siswaId: student.id,
      namaSiswa: student.nama,
      nis: student.nis,
      kelas: student.kelas,
      jumlahBayar: parseInt(jumlahBayar),
      metodePembayaran: paymentMethod,
      nomorRekening: paymentInfo[paymentMethod].accountNumber,
      tanggalPembayaran: now.toISOString().split('T')[0],
      waktuPembayaran: now.toTimeString().split(' ')[0],
      status: 'Verified', // Auto verified for demo
      nomorKwitansi: generateNomorKwitansi(),
      namaOrangTua: namaOrangTua
    };

    onPaymentSubmit(payment);
    setShowConfirmation(true);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Pembayaran Berhasil Dicatat
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Pembayaran Anda telah berhasil dicatat dalam sistem. Kwitansi pembayaran akan ditampilkan setelah Anda menutup dialog ini.
              </p>
              <p className="text-sm text-green-800 font-medium">
                Silakan hubungi bagian tata usaha via WhatsApp untuk konfirmasi pembayaran.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold">Jumlah Dibayar:</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseInt(jumlahBayar))}</p>
            </div>

            <Button 
              onClick={() => window.open(whatsappLink, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Konfirmasi via WhatsApp
            </Button>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Form Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">Data Siswa</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Nama:</span>
                <span className="ml-2 font-medium">{student.nama}</span>
              </div>
              <div>
                <span className="text-gray-600">Kelas:</span>
                <span className="ml-2 font-medium">{student.kelas}</span>
              </div>
              <div>
                <span className="text-gray-600">NIS:</span>
                <span className="ml-2 font-medium">{student.nis}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Tunggakan:</span>
                <span className="ml-2 font-medium text-red-600">{formatCurrency(student.tunggakan)}</span>
              </div>
            </div>
          </div>

          {/* Parent Name */}
          <div>
            <Label htmlFor="namaOrangTua">Nama Orang Tua/Wali</Label>
            <Input
              id="namaOrangTua"
              value={namaOrangTua}
              onChange={(e) => setNamaOrangTua(e.target.value)}
              placeholder="Masukkan nama orang tua/wali"
              className="mt-1"
            />
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="jumlahBayar">Jumlah Pembayaran</Label>
            <Input
              id="jumlahBayar"
              type="number"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              placeholder="Masukkan jumlah pembayaran"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimal pembayaran: {formatCurrency(1000)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block">Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="space-y-3">
                {(Object.keys(paymentInfo) as Array<'BCA' | 'BRI' | 'DANA'>).map((method) => (
                  <div 
                    key={method}
                    className={`flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <RadioGroupItem value={method} id={method} />
                    <Label htmlFor={method} className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className={`p-2 rounded ${paymentMethod === method ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {paymentInfo[method].icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{paymentInfo[method].name}</div>
                        <div className="text-sm text-gray-600">{paymentInfo[method].accountName}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Account Details */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Informasi Rekening {paymentInfo[paymentMethod].name}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Nomor Rekening/HP</div>
                  <div className="font-mono font-bold text-lg">{paymentInfo[paymentMethod].accountNumber}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(paymentInfo[paymentMethod].accountNumber, 'account')}
                >
                  {copiedAccount === 'account' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-xs text-gray-500 mb-1">Atas Nama</div>
                <div className="font-semibold">{paymentInfo[paymentMethod].accountName}</div>
              </div>
            </div>
          </div>

          {/* WhatsApp Confirmation */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Konfirmasi Pembayaran via WhatsApp
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Setelah melakukan transfer, silakan hubungi bagian tata usaha untuk konfirmasi pembayaran:
            </p>
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <div className="text-xs text-gray-500 mb-1">Nomor WhatsApp</div>
                <div className="font-mono font-semibold">{whatsappNumber}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(whatsappNumber, 'whatsapp')}
                >
                  {copiedAccount === 'whatsapp' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(whatsappLink, '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold mb-2 text-yellow-800">Petunjuk Pembayaran:</h3>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Transfer sesuai jumlah yang tertera</li>
              <li>Simpan bukti transfer</li>
              <li>Klik tombol "Proses Pembayaran" di bawah</li>
              <li>Hubungi WhatsApp untuk konfirmasi dan kirim bukti transfer</li>
              <li>Tunggu verifikasi dari bagian tata usaha</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!jumlahBayar || parseInt(jumlahBayar) <= 0 || !namaOrangTua}
            >
              Proses Pembayaran
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
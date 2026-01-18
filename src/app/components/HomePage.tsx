import { useState } from 'react';
import { Search, GraduationCap, Phone, Mail, MapPin, LogIn, CreditCard, CheckCircle, AlertCircle, Calendar, TrendingUp, DollarSign, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { PaymentModal } from '@/app/components/PaymentModal';
import { ReceiptModal } from '@/app/components/ReceiptModal';
import { motion } from 'motion/react';
import type { Student, Payment, Transaction, BiayaItem, SPPBulanan } from '@/app/types';

interface HomePageProps {
  students: Student[];
  sppBulanan: SPPBulanan[];
  onNavigateToLogin: () => void;
  onUpdateStudent: (student: Student) => void;
}

export function HomePage({ students, sppBulanan, onNavigateToLogin, onUpdateStudent }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  // Calculate SPP data for student
  const getStudentSPPData = (student: Student) => {
    const studentSPP = sppBulanan.filter(spp => spp.siswaId === student.id);
    
    // Get nominal infaq from localStorage
    const getNominalInfaq = () => {
      const saved = localStorage.getItem('nominalInfaq');
      if (saved) {
        const parsed = JSON.parse(saved);
        return student.status === 'Mukim' ? parsed.mukim : parsed.nonMukim;
      }
      // Default values
      return student.status === 'Mukim' ? 600000 : 400000;
    };
    
    const nominalPerBulan = getNominalInfaq();
    
    // Generate all months for the academic year
    const generateAllMonths = () => {
      const allMonths: Array<{
        bulan: string;
        tahunAjaran: string;
        monthName: string;
        data: SPPBulanan | null;
        nominalHarusBayar: number;
        terbayar: number;
        tunggakan: number;
        status: 'Lunas' | 'Sebagian' | 'Belum Lunas';
      }> = [];
      
      // Parse tahun ajaran (e.g., "2024/2025")
      const [startYear, endYear] = student.tahunAjaran.split('/').map(y => parseInt(y));
      
      // Academic year: Juli (07) to Juni (06) next year
      const months = [
        { num: '07', year: startYear },
        { num: '08', year: startYear },
        { num: '09', year: startYear },
        { num: '10', year: startYear },
        { num: '11', year: startYear },
        { num: '12', year: startYear },
        { num: '01', year: endYear },
        { num: '02', year: endYear },
        { num: '03', year: endYear },
        { num: '04', year: endYear },
        { num: '05', year: endYear },
        { num: '06', year: endYear },
      ];
      
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      months.forEach(({ num, year }) => {
        const existingData = studentSPP.find(spp => spp.bulan === num && spp.tahunAjaran === student.tahunAjaran);
        const monthIndex = parseInt(num) - 1;
        
        // Calculate values for this month
        const nominalHarusBayar = existingData ? existingData.jumlahSPP : nominalPerBulan;
        const terbayar = existingData ? existingData.terbayar : 0;
        const tunggakan = nominalHarusBayar - terbayar;
        const status = existingData 
          ? existingData.statusPembayaran 
          : 'Belum Lunas' as const;
        
        allMonths.push({
          bulan: num,
          tahunAjaran: student.tahunAjaran,
          monthName: `${monthNames[monthIndex]} ${year}`,
          data: existingData || null,
          nominalHarusBayar,
          terbayar,
          tunggakan,
          status,
        });
      });
      
      return allMonths;
    };
    
    const allMonths = generateAllMonths();
    
    // Calculate totals from allMonths
    const totalSPPHarusBayar = allMonths.reduce((sum, m) => sum + m.nominalHarusBayar, 0);
    const totalSPPTerbayar = allMonths.reduce((sum, m) => sum + m.terbayar, 0);
    const totalSPPTunggakan = allMonths.reduce((sum, m) => sum + m.tunggakan, 0);

    return {
      sppList: studentSPP,
      allMonths,
      nominalPerBulan,
      totalSPPHarusBayar,
      totalSPP: totalSPPHarusBayar, // Alias for backward compatibility
      totalSPPTerbayar,
      totalSPPTunggakan,
    };
  };

  // Get month name from month number
  const getMonthName = (monthStr: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthNum = parseInt(monthStr);
    return months[monthNum - 1] || '';
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    const student = students.find(
      s => s.nis.toLowerCase() === query || 
           s.nisn.toLowerCase() === query ||
           s.nama.toLowerCase().includes(query)
    );
    
    if (student) {
      setSearchResult(student);
      setNotFound(false);
    } else {
      setSearchResult(null);
      setNotFound(true);
    }
  };

  const handlePaymentSubmit = (payment: Payment) => {
    if (!searchResult) return;

    // Update student data
    const updatedStudent: Student = {
      ...searchResult,
      terbayar: searchResult.terbayar + payment.jumlahBayar,
      tunggakan: Math.max(0, searchResult.tunggakan - payment.jumlahBayar)
    };

    // Create transaction from payment
    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      siswaId: searchResult.id,
      namaSiswa: searchResult.nama,
      nis: searchResult.nis,
      kelas: searchResult.kelas,
      jumlah: payment.jumlahBayar,
      tanggal: payment.tanggalPembayaran,
      waktu: new Date().toLocaleTimeString('id-ID'),
      jenisPembayaran: 'Pembayaran Biaya Sekolah',
      keterangan: `Pembayaran dari ${payment.namaOrangTua} untuk siswa ${payment.namaSiswa} (${payment.kelas}) via ${payment.metodePembayaran}`,
      status: 'success',
    };

    // Save payment to localStorage
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    localStorage.setItem('payments', JSON.stringify([...existingPayments, payment]));

    // Save transaction to localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    localStorage.setItem('transactions', JSON.stringify([...existingTransactions, transaction]));

    // Update student in parent component
    onUpdateStudent(updatedStudent);
    
    // Update local search result
    setSearchResult(updatedStudent);
    
    // Save payment for receipt
    setCurrentPayment(payment);
    
    // Close payment modal
    setShowPaymentModal(false);
    
    // Show receipt modal
    setTimeout(() => {
      setShowReceiptModal(true);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <GraduationCap className="h-10 w-10 md:h-12 md:w-12" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold">SMK AL-ISHLAH CISAUK</h1>
                <p className="text-xs md:text-sm text-blue-100">Sistem Informasi Administrasi Biaya Sekolah</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                variant="secondary"
                onClick={onNavigateToLogin}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login Admin</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <ul className="flex gap-3 md:gap-6 py-4 overflow-x-auto">
            <li>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700 whitespace-nowrap text-sm md:text-base">Beranda</a>
            </li>
            <li>
              <a href="#cek-tunggakan" className="text-gray-600 hover:text-blue-600 whitespace-nowrap text-sm md:text-base">Cek Tunggakan</a>
            </li>
            <li>
              <a href="#fitur" className="text-gray-600 hover:text-blue-600 whitespace-nowrap text-sm md:text-base">Fitur</a>
            </li>
            <li>
              <a href="#tentang" className="text-gray-600 hover:text-blue-600 whitespace-nowrap text-sm md:text-base">Tentang</a>
            </li>
            <li>
              <a href="#kontak" className="text-gray-600 hover:text-blue-600 whitespace-nowrap text-sm md:text-base">Kontak</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section with Animation */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Selamat Datang di Sistem Administrasi Keuangan
            </h2>
          </motion.div>
          <motion.p 
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Orang tua/wali siswa dapat dengan mudah memeriksa rincian biaya dan tunggakan sekolah
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          id="fitur"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 max-w-5xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { icon: Search, title: 'Cek Tunggakan', desc: 'Cek tunggakan dengan mudah menggunakan NIS/NISN', color: 'from-blue-500 to-cyan-500' },
            { icon: CreditCard, title: 'Pembayaran Online', desc: 'Bayar tunggakan secara online kapan saja', color: 'from-indigo-500 to-purple-500' },
            { icon: DollarSign, title: 'Rincian Lengkap', desc: 'Lihat rincian biaya dan status pembayaran', color: 'from-purple-500 to-pink-500' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-200">
                <CardContent className="p-6">
                  <motion.div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Section with Animation */}
        <motion.div 
          id="cek-tunggakan" 
          className="max-w-3xl mx-auto mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Search className="h-5 w-5 md:h-6 md:w-6" />
                Cek Tunggakan Biaya Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Masukkan NIS, NISN, atau nama siswa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setNotFound(false);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 h-12 text-base"
                />
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </Button>
              </div>

              {notFound && (
                <motion.div 
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-700 text-sm md:text-base">Data siswa tidak ditemukan. Periksa kembali NIS, NISN, atau nama yang Anda masukkan.</p>
                </motion.div>
              )}

              {searchResult && (() => {
                const sppData = getStudentSPPData(searchResult);
                const totalKeseluruhan = searchResult.totalBiaya + sppData.totalSPP;
                const terbayarKeseluruhan = searchResult.terbayar + sppData.totalSPPTerbayar;
                const tunggakanKeseluruhan = totalKeseluruhan - terbayarKeseluruhan;

                return (
                <motion.div 
                  className="mt-6 space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Data Siswa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Nama:</span>
                        <span className="ml-2 font-medium">{searchResult.nama}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kelas:</span>
                        <span className="ml-2 font-medium">{searchResult.kelas}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NIS:</span>
                        <span className="ml-2 font-medium">{searchResult.nis}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NISN:</span>
                        <span className="ml-2 font-medium">{searchResult.nisn}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium">{searchResult.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tahun Ajaran:</span>
                        <span className="ml-2 font-medium">{searchResult.tahunAjaran}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ringkasan Total Biaya */}
                  <motion.div 
                    className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Ringkasan Total Keseluruhan
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/30 text-sm md:text-base">
                        <span>Total Biaya (Admin + SPP)</span>
                        <span className="font-semibold">{formatCurrency(totalKeseluruhan)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/30 text-sm md:text-base">
                        <span>Sudah Dibayar</span>
                        <span className="font-semibold">{formatCurrency(terbayarKeseluruhan)}</span>
                      </div>
                      <motion.div 
                        className="flex justify-between py-2"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="font-semibold text-base md:text-lg">Total Tunggakan</span>
                        <span className={`font-bold text-xl md:text-2xl ${tunggakanKeseluruhan > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
                          {formatCurrency(tunggakanKeseluruhan)}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Detail Breakdown Biaya */}
                  {searchResult.rincianBiaya && searchResult.rincianBiaya.length > 0 && (
                    <motion.div 
                      className="p-4 md:p-6 bg-white border border-gray-200 rounded-lg shadow"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        Rincian Biaya Administrasi
                      </h3>
                      <div className="overflow-x-auto -mx-4 md:mx-0">
                        <div className="inline-block min-w-full align-middle">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-gray-300">
                                <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700">Jenis Biaya</th>
                                <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700">Jumlah</th>
                                <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700 hidden sm:table-cell">Terbayar</th>
                                <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700">Tunggakan</th>
                                <th className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {searchResult.rincianBiaya.map((item: BiayaItem, index: number) => (
                                <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                  <td className="py-3 px-2 md:px-4 font-medium">{item.namaBiaya}</td>
                                  <td className="text-right py-3 px-2 md:px-4">{formatCurrency(item.jumlah)}</td>
                                  <td className="text-right py-3 px-2 md:px-4 text-green-600 font-medium hidden sm:table-cell">
                                    {formatCurrency(item.terbayar)}
                                  </td>
                                  <td className="text-right py-3 px-2 md:px-4 text-red-600 font-medium">
                                    {formatCurrency(item.tunggakan)}
                                  </td>
                                  <td className="text-center py-3 px-2 md:px-4">
                                    {item.status === 'Lunas' ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Lunas
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Belum
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-blue-50 border-t-2 border-blue-300 font-bold">
                                <td className="py-3 px-2 md:px-4 text-right">SUBTOTAL</td>
                                <td className="py-3 px-2 md:px-4 text-right text-blue-700">{formatCurrency(searchResult.totalBiaya)}</td>
                                <td className="py-3 px-2 md:px-4 text-right text-green-700 hidden sm:table-cell">{formatCurrency(searchResult.terbayar)}</td>
                                <td className="py-3 px-2 md:px-4 text-right text-red-700">{formatCurrency(searchResult.tunggakan)}</td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Rincian SPP Bulanan */}
                  <motion.div 
                    className="p-4 md:p-6 bg-white border border-gray-200 rounded-lg shadow"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      Rincian SPP Bulanan ({searchResult.status}) - Tahun Ajaran {searchResult.tahunAjaran}
                    </h3>
                    <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <strong>Nominal SPP per Bulan:</strong> {formatCurrency(sppData.nominalPerBulan)}
                      </p>
                    </div>
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-300">
                              <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700">Bulan</th>
                              <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700">Harus Bayar</th>
                              <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700 hidden sm:table-cell">Terbayar</th>
                              <th className="text-right py-3 px-2 md:px-4 font-semibold text-gray-700">Tunggakan</th>
                              <th className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sppData.allMonths.map((month, index) => {
                              return (
                                <tr key={`${month.bulan}-${index}`} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                  <td className="py-3 px-2 md:px-4 font-medium">{month.monthName}</td>
                                  <td className={`text-right py-3 px-2 md:px-4 font-semibold ${month.nominalHarusBayar > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {month.nominalHarusBayar > 0 ? formatCurrency(month.nominalHarusBayar) : '-'}
                                  </td>
                                  <td className={`text-right py-3 px-2 md:px-4 font-medium hidden sm:table-cell ${month.terbayar > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {month.terbayar > 0 ? formatCurrency(month.terbayar) : '-'}
                                  </td>
                                  <td className={`text-right py-3 px-2 md:px-4 font-medium ${month.tunggakan > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {month.tunggakan > 0 ? formatCurrency(month.tunggakan) : '-'}
                                  </td>
                                  <td className="text-center py-3 px-2 md:px-4">
                                    {month.status === 'Lunas' ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Lunas
                                      </Badge>
                                    ) : month.status === 'Sebagian' ? (
                                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Sebagian
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Belum Lunas
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-indigo-50 border-t-2 border-indigo-300 font-bold">
                              <td className="py-3 px-2 md:px-4 text-right">SUBTOTAL</td>
                              <td className="py-3 px-2 md:px-4 text-right text-indigo-700">{formatCurrency(sppData.totalSPPHarusBayar)}</td>
                              <td className="py-3 px-2 md:px-4 text-right text-green-700 hidden sm:table-cell">{formatCurrency(sppData.totalSPPTerbayar)}</td>
                              <td className="py-3 px-2 md:px-4 text-right text-red-700">{formatCurrency(sppData.totalSPPTunggakan)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ringkasan Total Tunggakan Yang Belum Dibayar */}
                  {(() => {
                    // Hitung tunggakan biaya administrasi (hanya yang belum lunas)
                    const tunggakanAdmin = searchResult.rincianBiaya
                      ? searchResult.rincianBiaya
                          .filter(item => item.status === 'Belum Lunas')
                          .reduce((sum, item) => sum + item.tunggakan, 0)
                      : 0;
                    
                    // Hitung tunggakan SPP (dari allMonths yang belum lunas atau sebagian)
                    const tunggakanSPP = sppData.allMonths
                      .filter(month => month.status !== 'Lunas')
                      .reduce((sum, month) => sum + month.tunggakan, 0);
                    
                    const totalTunggakanBelumBayar = tunggakanAdmin + tunggakanSPP;
                    
                    if (totalTunggakanBelumBayar > 0) {
                      return (
                        <motion.div 
                          className="p-4 md:p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg shadow-lg"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <h3 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-6 w-6" />
                            Total Tunggakan Yang Belum Dibayar
                          </h3>
                          <div className="space-y-3">
                            {tunggakanAdmin > 0 && (
                              <div className="flex justify-between py-2 border-b border-red-200 text-sm md:text-base">
                                <span className="text-gray-700">Tunggakan Biaya Administrasi</span>
                                <span className="font-bold text-red-700">{formatCurrency(tunggakanAdmin)}</span>
                              </div>
                            )}
                            {tunggakanSPP > 0 && (
                              <div className="flex justify-between py-2 border-b border-red-200 text-sm md:text-base">
                                <span className="text-gray-700">Tunggakan SPP Bulanan</span>
                                <span className="font-bold text-red-700">{formatCurrency(tunggakanSPP)}</span>
                              </div>
                            )}
                            <motion.div 
                              className="flex justify-between py-3 bg-red-600 text-white px-4 rounded-lg mt-2"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <span className="font-bold text-base md:text-lg">TOTAL YANG HARUS DIBAYAR</span>
                              <span className="font-bold text-xl md:text-2xl">
                                {formatCurrency(totalTunggakanBelumBayar)}
                              </span>
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}

                  {tunggakanKeseluruhan > 0 && (
                    <>
                      <motion.div 
                        className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-yellow-800 text-sm md:text-base">
                          <strong>Perhatian:</strong> Terdapat tunggakan sebesar {formatCurrency(tunggakanKeseluruhan)}. 
                          Silakan lakukan pembayaran melalui sistem online atau ke bagian tata usaha sekolah.
                        </p>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 md:h-14 text-base md:text-lg shadow-lg"
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          Bayar Sekarang
                        </Button>
                      </motion.div>
                    </>
                  )}

                  {tunggakanKeseluruhan === 0 && (
                    <motion.div 
                      className="p-4 bg-green-50 border border-green-300 rounded-lg"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-green-800 text-sm md:text-base">
                        <strong>Selamat!</strong> Tidak ada tunggakan biaya sekolah. Terima kasih atas pembayaran tepat waktu.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div 
          id="tentang" 
          className="max-w-4xl mx-auto mb-12"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl md:text-2xl">Tentang Sistem</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">
                Sistem Informasi Administrasi Biaya Sekolah SMK AL-ISHLAH CISAUK dirancang untuk memudahkan 
                orang tua/wali siswa dalam memantau status pembayaran dan tunggakan biaya sekolah secara online.
              </p>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Dengan sistem ini, Anda dapat mengecek rincian biaya dan tunggakan kapan saja dan dimana saja 
                hanya dengan memasukkan NIS atau NISN siswa.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          id="kontak" 
          className="max-w-4xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl md:text-2xl">Kontak Kami</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: MapPin, title: 'Alamat', content: 'Jl. Raya Cisauk, Tangerang Selatan, Banten', color: 'text-blue-600' },
                  { icon: Phone, title: 'Telepon', content: '(021) 1234-5678', color: 'text-green-600' },
                  { icon: Mail, title: 'Email', content: 'info@smkalishlah.sch.id', color: 'text-purple-600' },
                ].map((contact, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <contact.icon className={`h-5 w-5 ${contact.color} mt-1 flex-shrink-0`} />
                    <div>
                      <h4 className="font-semibold mb-1">{contact.title}</h4>
                      <p className="text-sm text-gray-600">{contact.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6" />
              <span className="font-semibold text-base md:text-lg">SMK AL-ISHLAH CISAUK</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Copyright &copy; {new Date().getFullYear()} SMK AL-ISHLAH CISAUK. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Payment Modal */}
      {searchResult && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSubmit={handlePaymentSubmit}
          student={searchResult}
        />
      )}

      {/* Receipt Modal */}
      {currentPayment && searchResult && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          payment={currentPayment}
          student={searchResult}
        />
      )}
    </div>
  );
}

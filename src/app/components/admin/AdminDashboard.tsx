import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCircle,
  GraduationCap,
  Wallet
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DashboardPage } from '@/app/components/admin/DashboardPage';
import { DataSiswaPage } from '@/app/components/admin/DataSiswaPage';
import { LaporanPage } from '@/app/components/admin/LaporanPage';
import { PemasukanPengeluaranPage } from '@/app/components/admin/PemasukanPengeluaranPage';
import { InfaqBulananPage } from '@/app/components/admin/InfaqBulananPage';
import { PengaturanPage } from '@/app/components/admin/PengaturanPage';
import { ProfilPage } from '@/app/components/admin/ProfilPage';
import type { Student, BiayaAdministrasi, Transaction, User, SPPBulanan } from '@/app/types';

interface AdminDashboardProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  biayaAdmin: BiayaAdministrasi[];
  setBiayaAdmin: (biaya: BiayaAdministrasi[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  sppBulanan: SPPBulanan[];
  setSppBulanan: (spp: SPPBulanan[]) => void;
  currentUser: User;
  onLogout: () => void;
}

type PageType = 'dashboard' | 'data-siswa' | 'laporan' | 'pemasukan-pengeluaran' | 'infaq-bulanan' | 'pengaturan' | 'profil';

export function AdminDashboard({
  students,
  setStudents,
  biayaAdmin,
  setBiayaAdmin,
  transactions,
  setTransactions,
  sppBulanan,
  setSppBulanan,
  currentUser,
  onLogout,
}: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-siswa' as PageType, label: 'Data Siswa', icon: Users },
    { id: 'laporan' as PageType, label: 'Laporan', icon: FileText },
    { id: 'pemasukan-pengeluaran' as PageType, label: 'Pemasukan & Pengeluaran', icon: TrendingUp },
    { id: 'infaq-bulanan' as PageType, label: 'Infaq Bulanan', icon: Wallet },
    { id: 'pengaturan' as PageType, label: 'Pengaturan', icon: Settings },
    { id: 'profil' as PageType, label: 'Profil Admin', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-6 w-6" />
            <h2 className="font-bold">SMK AL-ISHLAH</h2>
          </div>
          <p className="text-xs text-blue-100">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-white text-blue-600'
                  : 'hover:bg-blue-500 text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-500">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-xl font-semibold">
                {menuItems.find(item => item.id === currentPage)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser.nama}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && (
            <DashboardPage 
              students={students}
              transactions={transactions}
              biayaAdmin={biayaAdmin}
            />
          )}
          {currentPage === 'data-siswa' && (
            <DataSiswaPage 
              students={students}
              setStudents={setStudents}
            />
          )}
          {currentPage === 'laporan' && (
            <LaporanPage 
              students={students}
              transactions={transactions}
            />
          )}
          {currentPage === 'pemasukan-pengeluaran' && (
            <PemasukanPengeluaranPage 
              transactions={transactions}
              setTransactions={setTransactions}
              students={students}
              setStudents={setStudents}
            />
          )}
          {currentPage === 'infaq-bulanan' && (
            <InfaqBulananPage 
              students={students}
              sppBulanan={sppBulanan}
              setSppBulanan={setSppBulanan}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          )}
          {currentPage === 'pengaturan' && (
            <PengaturanPage 
              students={students}
              setStudents={setStudents}
              biayaAdmin={biayaAdmin}
              setBiayaAdmin={setBiayaAdmin}
            />
          )}
          {currentPage === 'profil' && (
            <ProfilPage currentUser={currentUser} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-6 py-3">
          <p className="text-sm text-gray-600 text-center">
            Copyright &copy; {new Date().getFullYear()} SMK AL-ISHLAH CISAUK
          </p>
        </footer>
      </div>
    </div>
  );
}
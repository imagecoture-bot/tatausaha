import { useState, useEffect } from 'react';
import { HomePage } from '@/app/components/HomePage';
import { LoginPage } from '@/app/components/LoginPage';
import { AdminDashboard } from '@/app/components/admin/AdminDashboard';
import { Toaster } from '@/app/components/ui/sonner';
import { initialStudents, initialBiayaAdministrasi, initialTransactions, initialUser } from '@/app/data/initialData';
import type { Student, BiayaAdministrasi, Transaction, User, SPPBulanan } from '@/app/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'admin'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [biayaAdmin, setBiayaAdmin] = useState<BiayaAdministrasi[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sppBulanan, setSppBulanan] = useState<SPPBulanan[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedBiaya = localStorage.getItem('biayaAdministrasi');
    const savedTransactions = localStorage.getItem('transactions');
    const savedSppBulanan = localStorage.getItem('sppBulanan');
    const savedUser = localStorage.getItem('currentUser');
    const savedLoginState = localStorage.getItem('isLoggedIn');

    // Load students and migrate old data to ensure rincianBiaya exists
    const loadedStudents = savedStudents ? JSON.parse(savedStudents) : initialStudents;
    const migratedStudents = loadedStudents.map((student: Student) => ({
      ...student,
      // Ensure rincianBiaya is always an array
      rincianBiaya: Array.isArray(student.rincianBiaya) ? student.rincianBiaya : []
    }));
    
    setStudents(migratedStudents);
    setBiayaAdmin(savedBiaya ? JSON.parse(savedBiaya) : initialBiayaAdministrasi);
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : initialTransactions);
    setSppBulanan(savedSppBulanan ? JSON.parse(savedSppBulanan) : []);
    
    if (savedLoginState === 'true' && savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(savedUser));
      setCurrentPage('admin');
    }
  }, []);

  // Save data to localStorage when changed
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('biayaAdministrasi', JSON.stringify(biayaAdmin));
  }, [biayaAdmin]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sppBulanan', JSON.stringify(sppBulanan));
  }, [sppBulanan]);

  const handleLogin = (username: string, password: string) => {
    if (username === initialUser.username && password === initialUser.password) {
      setIsLoggedIn(true);
      setCurrentUser(initialUser);
      setCurrentPage('admin');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(initialUser));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
    
    // Reload transactions from localStorage to sync with payment modal updates
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'home' && (
        <HomePage 
          students={students}
          sppBulanan={sppBulanan}
          onNavigateToLogin={() => setCurrentPage('login')}
          onUpdateStudent={handleUpdateStudent}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onBack={() => setCurrentPage('home')}
        />
      )}
      
      {currentPage === 'admin' && isLoggedIn && currentUser && (
        <AdminDashboard 
          students={students}
          setStudents={setStudents}
          biayaAdmin={biayaAdmin}
          setBiayaAdmin={setBiayaAdmin}
          transactions={transactions}
          setTransactions={setTransactions}
          sppBulanan={sppBulanan}
          setSppBulanan={setSppBulanan}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      <Toaster />
    </div>
  );
}
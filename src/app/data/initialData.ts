import type { Student, BiayaAdministrasi, Transaction, User } from '@/app/types';

// KOSONGKAN SEMUA DATA - ADMIN DAPAT MEMBUAT DATA BARU
export const initialStudents: Student[] = [];

export const initialBiayaAdministrasi: BiayaAdministrasi[] = [];

export const initialTransactions: Transaction[] = [];

export const initialUser: User = {
  username: 'admin',
  password: 'admin123',
  nama: 'Administrator',
  role: 'admin',
  email: 'admin@smkalishlah.sch.id'
};
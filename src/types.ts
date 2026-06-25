/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'docente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  course?: string; // For teachers, which course they lead
  si_pass?: boolean; // If they are logged in with temporary password
}

export interface Student {
  id: string; // uuid
  nombre: string;
  apellido: string;
  contacto: number; // int(9)
  grado: number; // int
  nivel: string; // text
  observacion: string; // text
  estado: boolean; // bool
  created_at?: string; // timestamp

  // Mapped/compatibility fields:
  name: string;
  email: string;
  grade: string;   // e.g. "10° Grado"
  section: string; // e.g. "A"
  parentName: string;
  parentPhone: string;
  balance: number; // monthly fee balance status: 0 is paid, positive is pending
  grades: {
    subject: string;
    score: number;
  }[];
  attendanceRate: number; // e.g. 96
  avatarUrl: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  id: string; // uuid
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  telefono: number; // int(9)
  codigo: string;
  foto_url: string;
  fecha_vencimiento: number;
  password?: string;
  si_pass: boolean; // True if first-time temp password needs to be changed
  activated?: boolean; // bool activado
  activado: boolean; // bool activado
  rol: string;
  created_at?: string;

  // Mapped/compatibility fields:
  name: string;
  email: string;
  subject: string;  // Specialization
  phone: string;
  salary: number;   // Monthly salary
  paymentStatus: 'paid' | 'pending';
  activeCourses: string[];
  avatarUrl: string;
  rating: number;   // Evaluation out of 5
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  updatedAt: string;
  children?: ResourceItem[]; // If type is folder
  url?: string;
  category?: 'Matemáticas' | 'Ciencias' | 'Historia' | 'Administrativo' | 'Otros';
}

export interface FinancialTransaction {
  id: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  concept: string;
  category: 'Colegiatura' | 'Salario Docente' | 'Material Educativo' | 'Servicios' | 'Otros';
  date: string; // YYYY-MM-DD
  studentId?: string; // If student payment
  teacherId?: string; // If teacher payment
}

export interface StudentAttendanceInstance {
  studentId: string;
  studentName: string;
  present: boolean;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  course: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  students: StudentAttendanceInstance[];
  comments?: string;
}

export type AccentColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'orange' | 'teal' | 'fuchsia' | 'violet';

export type LayoutStyle = 'frosted-glass' | 'windows-fluent' | 'neo-brutalist' | 'minimalist' | 'cosmic-dark';

export interface AppThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accentColor: AccentColor;
  layoutStyle?: LayoutStyle;
}

export interface SchoolNews {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'académico' | 'administrativo' | 'evento' | 'urgente';
  imageUrl?: string;
}

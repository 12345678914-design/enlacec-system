/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  User, 
  Student, 
  Teacher, 
  ResourceItem, 
  FinancialTransaction, 
  AttendanceRecord, 
  AppThemeConfig, 
  SchoolNews,
  AccentColor
} from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role: 'admin' | 'docente') => boolean;
  logout: () => void;
  changeTeacherPassword: (id: string, newPass: string) => void;
  
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  
  resources: ResourceItem[];
  addResource: (parentId: string | null, resource: Omit<ResourceItem, 'id' | 'updatedAt'>) => void;
  deleteResource: (id: string) => void;
  
  transactions: FinancialTransaction[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'date'>) => void;
  balance: number;
  
  attendance: AttendanceRecord[];
  registerAttendance: (record: Omit<AttendanceRecord, 'id' | 'time'>) => void;
  
  theme: AppThemeConfig;
  updateTheme: (theme: Partial<AppThemeConfig>) => void;
  
  news: SchoolNews[];
  addNews: (newsItem: Omit<SchoolNews, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial high-fidelity Mock Data in Spanish!
const INITIAL_STUDENTS: Student[] = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01',
    nombre: 'Sofía',
    apellido: 'Valentino',
    contacto: 987654321,
    grado: 10,
    nivel: 'Secundaria',
    observacion: 'Participación y desempeño destacado.',
    estado: true,
    created_at: '2026-06-15T08:00:00.000Z',
    name: 'Sofía Valentino',
    email: 'sofia.val@sistema.edu',
    grade: '10° Grado',
    section: 'A',
    parentName: 'María Valentino',
    parentPhone: '+51 987 654 321',
    balance: 0,
    grades: [
      { subject: 'Matemáticas', score: 18 },
      { subject: 'Ciencias', score: 16 },
      { subject: 'Historia', score: 19 },
    ],
    attendanceRate: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    status: 'active'
  },
  {
    id: '56af0b41-f762-4b2a-bf34-9721dafc3002',
    nombre: 'Mateo',
    apellido: 'Quispe',
    contacto: 912345678,
    grado: 11,
    nivel: 'Secundaria',
    observacion: 'Muestra interés pero requiere tutoría extra.',
    estado: true,
    created_at: '2026-06-15T08:30:00.000Z',
    name: 'Mateo Quispe',
    email: 'mateo.quispe@sistema.edu',
    grade: '11° Grado',
    section: 'B',
    parentName: 'Juan Quispe',
    parentPhone: '+51 912 345 678',
    balance: 150,
    grades: [
      { subject: 'Matemáticas', score: 14 },
      { subject: 'Ciencias', score: 15 },
      { subject: 'Historia', score: 12 },
    ],
    attendanceRate: 92,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    status: 'active'
  },
  {
    id: 'e281358d-7bf5-427f-94de-5f6cc810c003',
    nombre: 'Camila',
    apellido: 'Rojas',
    contacto: 965432109,
    grado: 10,
    nivel: 'Secundaria',
    observacion: 'Excelente conducta y dedicación académica.',
    estado: true,
    created_at: '2026-06-15T09:00:00.000Z',
    name: 'Camila Rojas',
    email: 'camila.rojas@sistema.edu',
    grade: '10° Grado',
    section: 'B',
    parentName: 'Andrés Rojas',
    parentPhone: '+51 965 432 109',
    balance: 0,
    grades: [
      { subject: 'Matemáticas', score: 20 },
      { subject: 'Ciencias', score: 19 },
      { subject: 'Historia', score: 17 },
    ],
    attendanceRate: 100,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    status: 'active'
  },
  {
    id: '8ef93db2-cf94-4d89-9ef9-c29013c8e004',
    nombre: 'Lucas',
    apellido: 'Mendoza',
    contacto: 945782134,
    grado: 11,
    nivel: 'Secundaria',
    observacion: 'Buen rendimiento, muy participativo en el aula.',
    estado: true,
    created_at: '2026-06-15T09:15:00.000Z',
    name: 'Lucas Mendoza',
    email: 'lucas.mendoza@sistema.edu',
    grade: '11° Grado',
    section: 'A',
    parentName: 'Fabiola Carranza',
    parentPhone: '+51 945 782 134',
    balance: 150,
    grades: [
      { subject: 'Matemáticas', score: 11 },
      { subject: 'Ciencias', score: 13 },
      { subject: 'Historia', score: 14 },
    ],
    attendanceRate: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    status: 'active'
  },
  {
    id: '012ea351-46da-4bad-bd23-64efbc78f005',
    nombre: 'Valentina',
    apellido: 'Díaz',
    contacto: 999888777,
    grado: 10,
    nivel: 'Secundaria',
    observacion: 'Ausente por temas médicos recurrentes.',
    estado: false,
    created_at: '2026-06-15T10:00:00.000Z',
    name: 'Valentina Díaz',
    email: 'valentina.diaz@sistema.edu',
    grade: '10° Grado',
    section: 'A',
    parentName: 'Carlos Díaz',
    parentPhone: '+51 999 888 777',
    balance: 0,
    grades: [
      { subject: 'Matemáticas', score: 15 },
      { subject: 'Ciencias', score: 17 },
      { subject: 'Historia', score: 15 },
    ],
    attendanceRate: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    status: 'inactive'
  },
  {
    id: 'd9e23ba8-cf94-4d89-9ef9-c29013c8e006',
    nombre: 'Diego',
    apellido: 'Torres',
    contacto: 988776655,
    grado: 11,
    nivel: 'Secundaria',
    observacion: 'Excelente deportista y compañero de grupo.',
    estado: true,
    created_at: '2026-06-15T10:30:00.000Z',
    name: 'Diego Torres',
    email: 'diego.torres@sistema.edu',
    grade: '11° Grado',
    section: 'A',
    parentName: 'Elena Torres',
    parentPhone: '+51 988 776 655',
    balance: 0,
    grades: [
      { subject: 'Matemáticas', score: 17 },
      { subject: 'Ciencias', score: 15 },
      { subject: 'Historia', score: 18 },
    ],
    attendanceRate: 96,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    status: 'active'
  }
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'f83d91bb-5991-49e0-811c-dcd2f3c8a001',
    nombre: 'Carlos',
    apellido: 'Fuentes',
    edad: 42,
    dni: 'DNI72345678',
    telefono: 954123456,
    codigo: 'DOC-001',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    fecha_vencimiento: 2028,
    password: 'docente123',
    si_pass: false,
    activado: true,
    rol: 'docente',
    created_at: '2026-06-01T08:00:00.000Z',
    name: 'Prof. Carlos Fuentes',
    email: 'carlos.fuentes@sistema.edu',
    subject: 'Matemáticas',
    phone: '+51 954 123 456',
    salary: 1800,
    paymentStatus: 'paid',
    activeCourses: ['10° Grado A', '11° Grado B'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    rating: 4.8
  },
  {
    id: '7ea4e1a7-ccfa-44cb-b391-7db9dfefc102',
    nombre: 'Ana',
    apellido: 'Cecilia',
    edad: 37,
    dni: 'DNI81234567',
    telefono: 985642111,
    codigo: 'DOC-002',
    foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    fecha_vencimiento: 2029,
    password: 'docente123',
    si_pass: false,
    activado: true,
    rol: 'docente',
    created_at: '2026-06-02T08:00:00.000Z',
    name: 'Dra. Ana Cecilia',
    email: 'ana.cecilia@sistema.edu',
    subject: 'Ciencias',
    phone: '+51 985 642 111',
    salary: 1950,
    paymentStatus: 'pending',
    activeCourses: ['10° Grado B', '11° Grado A'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    rating: 4.9
  },
  {
    id: 'c90a2be7-5c56-4b82-bc18-ee51ffaf3103',
    nombre: 'Fernando',
    apellido: 'Paz',
    edad: 45,
    dni: 'DNI93366699',
    telefono: 933666999,
    codigo: 'DOC-003',
    foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    fecha_vencimiento: 2027,
    password: 'docente123',
    si_pass: false,
    activado: true,
    rol: 'docente',
    created_at: '2026-06-03T08:00:00.000Z',
    name: 'Lic. Fernando Paz',
    email: 'fernando.paz@sistema.edu',
    subject: 'Historia',
    phone: '+51 933 666 999',
    salary: 1700,
    paymentStatus: 'paid',
    activeCourses: ['10° Grado A', '10° Grado B', '11° Grado B'],
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    rating: 4.5
  }
];

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-001',
    name: 'Matemáticas',
    type: 'folder',
    updatedAt: '2026-06-10 14:30',
    category: 'Matemáticas',
    children: [
      {
        id: 'RES-001-1',
        name: 'Syllabus_Algebra_Lineal.pdf',
        type: 'file',
        size: '1.2 MB',
        updatedAt: '2026-06-10 14:35',
        category: 'Matemáticas'
      },
      {
        id: 'RES-001-2',
        name: 'Ejercicios_Trigonometria_Resueltos.docx',
        type: 'file',
        size: '850 KB',
        updatedAt: '2026-06-11 09:15',
        category: 'Matemáticas'
      }
    ]
  },
  {
    id: 'RES-002',
    name: 'Ciencias de la Naturaleza',
    type: 'folder',
    updatedAt: '2026-06-08 11:20',
    category: 'Ciencias',
    children: [
      {
        id: 'RES-002-1',
        name: 'Guia_Laboratorio_Quimica_Organica.pdf',
        type: 'file',
        size: '3.4 MB',
        updatedAt: '2026-06-08 11:25',
        category: 'Ciencias'
      },
      {
        id: 'RES-002-2',
        name: 'Diapositivas_Metabolismo_Celular.pptx',
        type: 'file',
        size: '5.1 MB',
        updatedAt: '2026-06-09 16:40',
        category: 'Ciencias'
      }
    ]
  },
  {
    id: 'RES-003',
    name: 'Planificaciones Académicas',
    type: 'folder',
    updatedAt: '2026-06-12 08:00',
    category: 'Administrativo',
    children: [
      {
        id: 'RES-003-1',
        name: 'Calendario_Academico_Editable_2026.xlsx',
        type: 'file',
        size: '920 KB',
        updatedAt: '2026-06-12 08:02',
        category: 'Administrativo'
      },
      {
        id: 'RES-003-2',
        name: 'Reglamento_Interno_ENLACEC_v3.pdf',
        type: 'file',
        size: '2.8 MB',
        updatedAt: '2026-06-12 08:15',
        category: 'Administrativo'
      }
    ]
  }
];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TX-001',
    type: 'ingreso',
    amount: 150,
    concept: 'Pago Mensualidad - Sofía Valentino',
    category: 'Colegiatura',
    date: '2026-06-01',
    studentId: 'EST-001'
  },
  {
    id: 'TX-002',
    type: 'ingreso',
    amount: 150,
    concept: 'Pago Mensualidad - Camila Rojas',
    category: 'Colegiatura',
    date: '2026-06-02',
    studentId: 'EST-003'
  },
  {
    id: 'TX-003',
    type: 'egreso',
    amount: 1800,
    concept: 'Pago Planilla Mayo - Carlos Fuentes',
    category: 'Salario Docente',
    date: '2026-06-05',
    teacherId: 'DOC-001'
  },
  {
    id: 'TX-004',
    type: 'egreso',
    amount: 1700,
    concept: 'Pago Planilla Mayo - Fernando Paz',
    category: 'Salario Docente',
    date: '2026-06-05',
    teacherId: 'DOC-003'
  },
  {
    id: 'TX-005',
    type: 'ingreso',
    amount: 5000,
    concept: 'Subvención Estatal para Equipamiento',
    category: 'Otros',
    date: '2026-06-08'
  },
  {
    id: 'TX-006',
    type: 'egreso',
    amount: 450,
    concept: 'Compra de reactivos de Química',
    category: 'Material Educativo',
    date: '2026-06-12'
  }
];

const INITIAL_NEWS: SchoolNews[] = [
  {
    id: 'NEW-001',
    title: 'Nueva Biblioteca Virtual Implementada',
    content: 'A partir de la próxima semana, todos los estudiantes y docentes tendrán acceso gratuito a la nueva plataforma de libros digitales de investigación con más de 10,000 archivos escolares.',
    date: '2026-06-12',
    author: 'Dirección Académica',
    category: 'académico',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'NEW-002',
    title: 'Aniversario Institucional y Feria Tecnológica',
    content: 'Se invita a toda la comunidad estudiantil a participar del 15° aniversario de nuestro colegio. Tendremos stands de robótica, proyectos de ciencias y una gran kermés familiar.',
    date: '2026-06-10',
    author: 'Comisión de Eventos',
    category: 'evento',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400'
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-001',
    teacherId: 'DOC-001',
    teacherName: 'Prof. Carlos Fuentes',
    course: '10° Grado A',
    date: '2026-06-15',
    time: '08:15',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Clase de Álgebra Lineal. Participación activa de todo el grupo.'
  },
  {
    id: 'ATT-002',
    teacherId: 'DOC-002',
    teacherName: 'Dra. Ana Cecilia',
    course: '10° Grado A',
    date: '2026-06-12',
    time: '10:30',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: false },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Práctica de laboratorio de Química. Camila Rojas justificó inasistencia médica.'
  },
  {
    id: 'ATT-003',
    teacherId: 'DOC-003',
    teacherName: 'Lic. Fernando Paz',
    course: '10° Grado A',
    date: '2026-06-10',
    time: '09:00',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Exposición grupal sobre la Revolución Industrial.'
  },
  {
    id: 'ATT-004',
    teacherId: 'DOC-001',
    teacherName: 'Prof. Carlos Fuentes',
    course: '10° Grado A',
    date: '2026-06-08',
    time: '08:15',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: false }
    ],
    comments: 'Ecuaciones de segundo grado.'
  },
  {
    id: 'ATT-005',
    teacherId: 'DOC-002',
    teacherName: 'Dra. Ana Cecilia',
    course: '10° Grado A',
    date: '2026-06-05',
    time: '10:30',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Clase regular de Biología Celular.'
  },
  {
    id: 'ATT-006',
    teacherId: 'DOC-003',
    teacherName: 'Lic. Fernando Paz',
    course: '10° Grado A',
    date: '2026-06-03',
    time: '09:00',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: false },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Sofía Valentino llegó tarde con justificación firmada por su apoderado.'
  },
  {
    id: 'ATT-007',
    teacherId: 'DOC-001',
    teacherName: 'Prof. Carlos Fuentes',
    course: '10° Grado A',
    date: '2026-06-01',
    time: '08:15',
    students: [
      { studentId: 'EST-001', studentName: 'Sofía Valentino', present: true },
      { studentId: 'EST-003', studentName: 'Camila Rojas', present: true },
      { studentId: 'EST-005', studentName: 'Valentina Díaz', present: true }
    ],
    comments: 'Inicio de la unidad didáctica de funciones trigonométricas.'
  },
  {
    id: 'ATT-008',
    teacherId: 'DOC-001',
    teacherName: 'Prof. Carlos Fuentes',
    course: '11° Grado B',
    date: '2026-06-12',
    time: '11:45',
    students: [
      { studentId: 'EST-002', studentName: 'Mateo Quispe', present: true },
      { studentId: 'EST-004', studentName: 'Lucas Mendoza', present: true }
    ],
    comments: 'Álgebra avanzada, límites matemáticos.'
  },
  {
    id: 'ATT-009',
    teacherId: 'DOC-002',
    teacherName: 'Dra. Ana Cecilia',
    course: '11° Grado B',
    date: '2026-06-09',
    time: '13:00',
    students: [
      { studentId: 'EST-002', studentName: 'Mateo Quispe', present: false },
      { studentId: 'EST-004', studentName: 'Lucas Mendoza', present: true }
    ],
    comments: 'Física cuántica elemental. Mateo Quispe con falta injustificada.'
  },
  {
    id: 'ATT-010',
    teacherId: 'DOC-003',
    teacherName: 'Lic. Fernando Paz',
    course: '11° Grado B',
    date: '2026-06-05',
    time: '11:45',
    students: [
      { studentId: 'EST-002', studentName: 'Mateo Quispe', present: true },
      { studentId: 'EST-004', studentName: 'Lucas Mendoza', present: false }
    ],
    comments: 'Análisis crítico sobre la caída de Constantinopla. Lucas Mendoza ausente.'
  }
];

// --- MAPPER HELPERS FOR RESILIENT DATABASE CONFIGURATION ---
const mapStudentFromDb = (row: any): Student => {
  const nombre = row.nombre || row.name?.split(' ')[0] || '';
  const apellido = row.apellido || row.name?.split(' ').slice(1).join(' ') || '';
  return {
    id: row.id,
    nombre,
    apellido,
    contacto: Number(row.contacto || row.parentPhone?.replace(/\D/g, '')?.slice(-9) || 987654321),
    grado: Number(row.grado || parseInt(row.grade) || 10),
    nivel: row.nivel || (row.grade?.includes('11') || row.grade?.includes('10') ? 'Secundaria' : 'Primaria'),
    observacion: row.observacion || '',
    estado: row.estado !== undefined ? !!row.estado : (row.status === 'active'),
    created_at: row.created_at || new Date().toISOString(),

    // compatibility
    name: row.name || `${nombre} ${apellido}`.trim(),
    email: row.email || `${nombre.toLowerCase()}.${apellido.toLowerCase().replace(/\s+/g, '')}@sistema.edu`,
    grade: row.grade || `${row.grado || 10}° Grado`,
    section: row.section || 'A',
    parentName: row.parent_name || row.parentName || `Apoderado de ${nombre}`,
    parentPhone: row.parent_phone || row.parentPhone || `+51 ${row.contacto || 987654321}`,
    balance: Number(row.balance ?? 0),
    grades: Array.isArray(row.grades) ? row.grades : [],
    attendanceRate: Number(row.attendance_rate !== undefined ? row.attendance_rate : (row.attendanceRate ?? 95)),
    avatarUrl: row.avatar_url !== undefined ? row.avatar_url : (row.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'),
    status: (row.status || (row.estado ? 'active' : 'inactive')) as 'active' | 'inactive'
  };
};

const mapStudentToDb = (s: Student) => ({
  id: s.id,
  nombre: s.nombre,
  apellido: s.apellido,
  contacto: s.contacto,
  grado: s.grado,
  nivel: s.nivel,
  observacion: s.observacion,
  estado: s.estado,
  created_at: s.created_at || new Date().toISOString(),
  
  // compatibility with potential legacy supabase students table
  name: s.name,
  email: s.email,
  grade: s.grade,
  section: s.section,
  parent_name: s.parentName,
  parentName: s.parentName,
  parent_phone: s.parentPhone,
  parentPhone: s.parentPhone,
  balance: s.balance,
  grades: s.grades,
  attendance_rate: s.attendanceRate,
  attendanceRate: s.attendanceRate,
  avatar_url: s.avatarUrl,
  avatarUrl: s.avatarUrl,
  status: s.status
});

const mapTeacherFromDb = (row: any): Teacher => {
  const nombre = row.nombre || row.name?.replace('Prof. ', '')?.replace('Dra. ', '')?.replace('Lic. ', '')?.split(' ')[0] || '';
  const apellido = row.apellido || row.name?.replace('Prof. ', '')?.replace('Dra. ', '')?.replace('Lic. ', '')?.split(' ').slice(1).join(' ') || '';
  return {
    id: row.id,
    nombre,
    apellido,
    edad: Number(row.edad || 35),
    dni: row.dni || `DNI${Math.floor(10000000 + Math.random() * 90000000)}`,
    telefono: Number(row.telefono || row.phone?.replace(/\D/g, '')?.slice(-9) || 954123456),
    codigo: row.codigo || `DOC-${Math.floor(100 + Math.random() * 900)}`,
    foto_url: row.foto_url || row.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    fecha_vencimiento: Number(row.fecha_vencimiento || 2028),
    password: row.password || 'docente123',
    si_pass: row.si_pass !== undefined ? !!row.si_pass : false,
    activado: row.activado !== undefined ? !!row.activado : true,
    rol: row.rol || 'docente',
    created_at: row.created_at || new Date().toISOString(),

    // compatibility
    name: row.name || `Prof. ${nombre} ${apellido}`,
    email: row.email || `${nombre.toLowerCase()}.${apellido.toLowerCase().replace(/\s+/g, '')}@sistema.edu`,
    subject: row.subject || 'Matemáticas',
    phone: row.phone || `+51 ${row.telefono || 954123456}`,
    salary: Number(row.salary ?? 1800),
    paymentStatus: (row.payment_status !== undefined ? row.payment_status : (row.paymentStatus || 'pending')) as 'paid' | 'pending',
    activeCourses: Array.isArray(row.active_courses) ? row.active_courses : (Array.isArray(row.activeCourses) ? row.activeCourses : ['10° Grado A']),
    avatarUrl: row.avatar_url !== undefined ? row.avatar_url : (row.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'),
    rating: Number(row.rating ?? 4.5)
  };
};

const mapTeacherToDb = (t: Teacher) => ({
  id: t.id,
  nombre: t.nombre,
  apellido: t.apellido,
  edad: t.edad,
  dni: t.dni,
  telefono: t.telefono,
  codigo: t.codigo,
  foto_url: t.foto_url,
  fecha_vencimiento: t.fecha_vencimiento,
  password: t.password,
  si_pass: t.si_pass,
  activado: t.activado,
  rol: t.rol,
  created_at: t.created_at || new Date().toISOString(),

  // compatibility
  name: t.name,
  email: t.email,
  subject: t.subject,
  phone: t.phone,
  salary: t.salary,
  payment_status: t.paymentStatus,
  paymentStatus: t.paymentStatus,
  active_courses: t.activeCourses,
  activeCourses: t.activeCourses,
  avatar_url: t.avatarUrl,
  avatarUrl: t.avatarUrl,
  rating: t.rating
});

function buildResourceTree(rows: any[]): ResourceItem[] {
  const itemMap = new Map<string, ResourceItem & { parent_id?: string | null; parentId?: string | null }>();
  
  rows.forEach(row => {
    const mapped: any = {
      id: row.id,
      name: row.name || '',
      type: (row.type || 'file') as 'file' | 'folder',
      size: row.size || undefined,
      updatedAt: row.updated_at !== undefined ? row.updated_at : (row.updatedAt || ''),
      category: row.category || undefined,
      url: row.url || undefined,
      parent_id: row.parent_id !== undefined ? row.parent_id : row.parentId,
      parentId: row.parent_id !== undefined ? row.parent_id : row.parentId,
      ...(row.type === 'folder' ? { children: [] } : {})
    };
    itemMap.set(mapped.id, mapped);
  });
  
  const roots: ResourceItem[] = [];
  
  itemMap.forEach(item => {
    const pId = item.parent_id || item.parentId;
    if (pId) {
      const parent = itemMap.get(pId);
      if (parent) {
        if (!parent.children) parent.children = [];
        const { parent_id, parentId, ...cleanItem } = item;
        parent.children.push(cleanItem as ResourceItem);
      } else {
        const { parent_id, parentId, ...cleanItem } = item;
        roots.push(cleanItem as ResourceItem);
      }
    } else {
      const { parent_id, parentId, ...cleanItem } = item;
      roots.push(cleanItem as ResourceItem);
    }
  });
  
  return roots;
}

const mapTransactionFromDb = (row: any): FinancialTransaction => ({
  id: row.id,
  type: (row.type || 'ingreso') as 'ingreso' | 'egreso',
  amount: Number(row.amount ?? 0),
  concept: row.concept || '',
  category: (row.category || 'Otros') as any,
  date: row.date || '',
  studentId: row.student_id !== undefined ? row.student_id : row.studentId,
  teacherId: row.teacher_id !== undefined ? row.teacher_id : row.teacherId
});

const mapTransactionToDb = (tx: FinancialTransaction) => ({
  id: tx.id,
  type: tx.type,
  amount: tx.amount,
  concept: tx.concept,
  category: tx.category,
  date: tx.date,
  student_id: tx.studentId || null,
  studentId: tx.studentId || null,
  teacher_id: tx.teacherId || null,
  teacherId: tx.teacherId || null
});

const mapAttendanceFromDb = (row: any): AttendanceRecord => ({
  id: row.id,
  teacherId: row.teacher_id !== undefined ? row.teacher_id : row.teacherId,
  teacherName: row.teacher_name !== undefined ? row.teacher_name : row.teacherName,
  course: row.course || '',
  date: row.date || '',
  time: row.time || '',
  students: Array.isArray(row.students) ? row.students : (typeof row.students === 'string' ? JSON.parse(row.students) : []),
  comments: row.comments || ''
});

const mapAttendanceToDb = (att: AttendanceRecord) => ({
  id: att.id,
  teacher_id: att.teacherId,
  teacherId: att.teacherId,
  teacher_name: att.teacherName,
  teacherName: att.teacherName,
  course: att.course,
  date: att.date,
  time: att.time,
  students: att.students,
  comments: att.comments || ''
});

const mapNewsFromDb = (row: any): SchoolNews => ({
  id: row.id,
  title: row.title || '',
  content: row.content || '',
  date: row.date || '',
  author: row.author || '',
  category: (row.category || 'académico') as any,
  imageUrl: row.image_url !== undefined ? row.image_url : row.imageUrl
});

const mapNewsToDb = (n: SchoolNews) => ({
  id: n.id,
  title: n.title,
  content: n.content,
  date: n.date,
  author: n.author,
  category: n.category,
  image_url: n.imageUrl || null,
  imageUrl: n.imageUrl || null
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edu_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Data states
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edu_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('edu_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('edu_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('edu_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('edu_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [news, setNews] = useState<SchoolNews[]>(() => {
    const saved = localStorage.getItem('edu_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  // Global theme settings
  const [theme, setTheme] = useState<AppThemeConfig>(() => {
    const saved = localStorage.getItem('edu_theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.layoutStyle) parsed.layoutStyle = 'windows-fluent';
      return parsed;
    }
    return {
      mode: 'system',
      accentColor: 'blue',
      layoutStyle: 'windows-fluent'
    };
  });

  // School cash flow balance indicator (default starting at 12,450.00 COP/USD/etc.)
  const [balance, setBalance] = useState<number>(() => {
    const txTotal = transactions.reduce((acc, curr) => {
      return curr.type === 'ingreso' ? acc + curr.amount : acc - curr.amount;
    }, 15000);
    return txTotal;
  });

  // Load from Supabase on mount
  const loadData = async () => {
    try {
      // 1. Students
      const { data: stds, error: e1 } = await supabase.from('students').select('*');
      if (!e1 && stds && stds.length > 0) {
        setStudents(stds.map(mapStudentFromDb));
      }

      // 2. Teachers
      const { data: tchs, error: e2 } = await supabase.from('teachers').select('*');
      if (!e2 && tchs && tchs.length > 0) {
        setTeachers(tchs.map(mapTeacherFromDb));
      }

      // 3. Resources
      const { data: rscs, error: e3 } = await supabase.from('resources').select('*');
      if (!e3 && rscs && rscs.length > 0) {
        setResources(buildResourceTree(rscs));
      }

      // 4. Transactions
      const { data: txs, error: e4 } = await supabase.from('transactions').select('*');
      if (!e4 && txs && txs.length > 0) {
        setTransactions(txs.map(mapTransactionFromDb));
      }

      // 5. Attendance
      let atLoaded = false;
      const { data: att, error: e5 } = await supabase.from('attendance').select('*');
      if (!e5 && att && att.length > 0) {
        setAttendance(att.map(mapAttendanceFromDb));
        atLoaded = true;
      }
      if (!atLoaded) {
        const { data: attRec, error: e5Alt } = await supabase.from('attendance_records').select('*');
        if (!e5Alt && attRec && attRec.length > 0) {
          setAttendance(attRec.map(mapAttendanceFromDb));
        }
      }

      // 6. News
      const { data: nws, error: e6 } = await supabase.from('news').select('*');
      if (!e6 && nws && nws.length > 0) {
        setNews(nws.map(mapNewsFromDb));
      }
    } catch (err) {
      console.warn('Real-time connection with Supabase is not available or tables are missed. Reverted to local caching.', err);
    }
  };

  // Seed helper if Supabase connected but tables are empty
  const seedIfEmpty = async () => {
    try {
      const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true });
      if (!error && (count === null || count === 0)) {
        await supabase.from('students').insert(INITIAL_STUDENTS.map(mapStudentToDb));
        await supabase.from('teachers').insert(INITIAL_TEACHERS.map(mapTeacherToDb));
        await supabase.from('transactions').insert(INITIAL_TRANSACTIONS.map(mapTransactionToDb));
        await supabase.from('news').insert(INITIAL_NEWS.map(mapNewsToDb));
        
        // Flatten and seed resources
        const flattenResources = (items: ResourceItem[], parentId: string | null = null): any[] => {
          let rows: any[] = [];
          items.forEach(item => {
            rows.push({
              id: item.id,
              name: item.name,
              type: item.type,
              size: item.size || null,
              category: item.category || null,
              url: item.url || null,
              parent_id: parentId,
              parentId: parentId,
              updated_at: item.updatedAt,
              updatedAt: item.updatedAt
            });
            if (item.children && item.children.length > 0) {
              rows = [...rows, ...flattenResources(item.children, item.id)];
            }
          });
          return rows;
        };
        const flatRes = flattenResources(INITIAL_RESOURCES);
        await supabase.from('resources').insert(flatRes);

        const { error: attErr } = await supabase.from('attendance').insert(INITIAL_ATTENDANCE.map(mapAttendanceToDb));
        if (attErr) {
          await supabase.from('attendance_records').insert(INITIAL_ATTENDANCE.map(mapAttendanceToDb));
        }
        
        console.log('Successfully seeded Supabase with offline starter data!');
        await loadData();
      }
    } catch (err) {
      console.warn('Auto-seeding could not complete on Supabase database, likely missing target tables Schema.', err);
    }
  };

  // Run on start
  useEffect(() => {
    loadData().then(() => {
      const hasUrl = !!(import.meta as any).env?.VITE_SUPABASE_URL;
      const hasKey = !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      if (hasUrl && hasKey) {
        seedIfEmpty();
      }
    });

    const hasExpandedSeeding = localStorage.getItem('edu_seeded_v3_expanded') === 'true';
    if (!hasExpandedSeeding) {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('edu_seeded_v3_expanded', 'true');
    }
  }, []);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('edu_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('edu_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edu_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('edu_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('edu_transactions', JSON.stringify(transactions));
    const txTotal = transactions.reduce((acc, curr) => {
      return curr.type === 'ingreso' ? acc + curr.amount : acc - curr.amount;
    }, 15000);
    setBalance(txTotal);
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('edu_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('edu_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('edu_theme', JSON.stringify(theme));
    
    const root = window.document.documentElement;
    const layout = theme.layoutStyle || 'windows-fluent';
    root.classList.remove('style-frosted-glass', 'style-windows-fluent', 'style-neo-brutalist', 'style-minimalist', 'style-cosmic-dark');
    root.classList.add(`style-${layout}`);
    
    const isCosmic = layout === 'cosmic-dark';
    const applyThemeMode = (isDark: boolean) => {
      const finalDark = isCosmic || isDark;
      if (finalDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme.mode === 'dark') {
      applyThemeMode(true);
    } else if (theme.mode === 'light') {
      applyThemeMode(false);
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyThemeMode(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyThemeMode(e.matches);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        (mediaQuery as any).addListener(handleChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          (mediaQuery as any).removeListener(handleChange);
        }
      };
    }
  }, [theme]);

  // Login handler
  const login = (email: string, role: 'admin' | 'docente'): boolean => {
    const formattedEmail = email.toLowerCase().trim();
    if (role === 'admin') {
      if (formattedEmail === 'admin@sistema.edu' || formattedEmail === 'admin') {
        setCurrentUser({
          id: 'USR-ADMIN',
          name: 'Directora Patricia Mendoza',
          email: 'admin@sistema.edu',
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
        });
        return true;
      }
    } else {
      const matchedTeacher = teachers.find(t => t.email.toLowerCase().trim() === formattedEmail);
      if (matchedTeacher) {
        setCurrentUser({
          id: matchedTeacher.id,
          name: matchedTeacher.name,
          email: matchedTeacher.email,
          role: 'docente',
          avatarUrl: matchedTeacher.avatarUrl,
          course: matchedTeacher.activeCourses[0],
          si_pass: matchedTeacher.si_pass
        });
        return true;
      } else if (formattedEmail === 'docente@sistema.edu' || formattedEmail === 'docente') {
        const firstTeacher = teachers[0] || INITIAL_TEACHERS[0];
        setCurrentUser({
          id: firstTeacher.id,
          name: firstTeacher.name,
          email: firstTeacher.email,
          role: 'docente',
          avatarUrl: firstTeacher.avatarUrl,
          course: firstTeacher.activeCourses[0],
          si_pass: firstTeacher.si_pass
        });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Helper for generating automatic UUIDs
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Student CRUD actions with Supabase write-through
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const newId = generateUUID();
    const newStudent: Student = {
      ...studentData,
      id: newId,
      created_at: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
    
    try {
      await supabase.from('students').insert([mapStudentToDb(newStudent)]);
    } catch (e) {
      console.error('Error writing student to Supabase:', e);
    }
    
    if (studentData.balance === 0) {
      addTransaction({
        type: 'ingreso',
        amount: 150,
        concept: `Inscripción y Matrícula - ${studentData.name}`,
        category: 'Colegiatura',
        studentId: newStudent.id
      });
    }
  };

  const updateStudent = async (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    try {
      await supabase.from('students').update(mapStudentToDb(updated)).eq('id', updated.id);
    } catch (e) {
      console.error('Error updating student in Supabase:', e);
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      await supabase.from('students').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting student from Supabase:', e);
    }
  };

  // Teacher/Docente CRUD actions with Supabase write-through
  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    const tempPassword = `temp-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: generateUUID(),
      password: tempPassword,
      si_pass: true, // Mark that they need to change password on first login
      activado: true,
      created_at: new Date().toISOString()
    };
    setTeachers(prev => [...prev, newTeacher]);
    try {
      await supabase.from('teachers').insert([mapTeacherToDb(newTeacher)]);
    } catch (e) {
      console.error('Error adding teacher to Supabase:', e);
    }
  };

  const updateTeacher = async (updated: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
    
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(prev => prev ? {
        ...prev,
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl
      } : null);
    }

    try {
      await supabase.from('teachers').update(mapTeacherToDb(updated)).eq('id', updated.id);
    } catch (e) {
      console.error('Error updating teacher in Supabase:', e);
    }
  };

  const deleteTeacher = async (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from('teachers').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting teacher from Supabase:', e);
    }
  };

  // Resource actions with Supabase write-through
  const addResource = async (parentId: string | null, resourceData: Omit<ResourceItem, 'id' | 'updatedAt'>) => {
    const generateId = () => `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const newId = generateId();
    
    const newRes: ResourceItem = {
      ...resourceData,
      id: newId,
      updatedAt: timestamp,
      ...(resourceData.type === 'folder' ? { children: [] } : {})
    };

    if (parentId === null) {
      setResources(prev => [...prev, newRes]);
    } else {
      const addToChildren = (items: ResourceItem[]): ResourceItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newRes]
            };
          } else if (item.children) {
            return {
              ...item,
              children: addToChildren(item.children)
            };
          }
          return item;
        });
      };
      setResources(prev => addToChildren(prev));
    }

    try {
      const dbRow = {
        id: newId,
        name: resourceData.name,
        type: resourceData.type,
        size: resourceData.size || null,
        category: resourceData.category || null,
        url: resourceData.url || null,
        parent_id: parentId,
        parentId: parentId,
        updated_at: timestamp,
        updatedAt: timestamp
      };
      await supabase.from('resources').insert([dbRow]);
    } catch (e) {
      console.error('Error adding resource to Supabase:', e);
    }
  };

  const deleteResource = async (id: string) => {
    const removeFromList = (items: ResourceItem[]): ResourceItem[] => {
      return items
        .filter(item => item.id !== id)
        .map(item => {
          if (item.children) {
            return {
              ...item,
              children: removeFromList(item.children)
            };
          }
          return item;
        });
    };
    setResources(prev => removeFromList(prev));

    try {
      const { data: allItems } = await supabase.from('resources').select('id, parent_id, parentId');
      if (allItems) {
        const idsToDelete = [id];
        let added = true;
        while (added) {
          added = false;
          for (const row of allItems) {
            const rowPId = row.parent_id || row.parentId;
            if (rowPId && idsToDelete.includes(rowPId) && !idsToDelete.includes(row.id)) {
              idsToDelete.push(row.id);
              added = true;
            }
          }
        }
        await supabase.from('resources').delete().in('id', idsToDelete);
      } else {
        await supabase.from('resources').delete().eq('id', id);
      }
    } catch (e) {
      console.error('Error deleting resource from Supabase:', e);
    }
  };

  // Finance actions with Supabase write-through
  const addTransaction = async (txData: Omit<FinancialTransaction, 'id' | 'date'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: FinancialTransaction = {
      ...txData,
      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
      date: todayStr
    };
    setTransactions(prev => [newTx, ...prev]);

    if (txData.studentId && txData.category === 'Colegiatura') {
      const s = students.find(item => item.id === txData.studentId);
      if (s) {
        await updateStudent({ ...s, balance: Math.max(0, s.balance - txData.amount) });
      }
    }
    if (txData.teacherId && txData.category === 'Salario Docente') {
      const t = teachers.find(item => item.id === txData.teacherId);
      if (t) {
        await updateTeacher({ ...t, paymentStatus: 'paid' });
      }
    }

    try {
      await supabase.from('transactions').insert([mapTransactionToDb(newTx)]);
    } catch (e) {
      console.error('Error adding transaction to Supabase:', e);
    }
  };

  // Attendance actions with Supabase write-through
  const registerAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'time'>) => {
    const timeFormatted = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `ATT-${Math.floor(100 + Math.random() * 900)}`,
      time: timeFormatted
    };
    setAttendance(prev => [newRecord, ...prev]);

    recordData.students.forEach(async (studentAtt) => {
      const s = students.find(item => item.id === studentAtt.studentId);
      if (s) {
        const previousRate = s.attendanceRate;
        const delta = studentAtt.present ? 0.3 : -1.5;
        const nextRate = Math.min(100, Math.max(50, parseFloat((previousRate + delta).toFixed(1))));
        await updateStudent({ ...s, attendanceRate: nextRate });
      }
    });

    try {
      const { error } = await supabase.from('attendance').insert([mapAttendanceToDb(newRecord)]);
      if (error) {
        await supabase.from('attendance_records').insert([mapAttendanceToDb(newRecord)]);
      }
    } catch (e) {
      console.error('Error registering attendance to Supabase:', e);
    }
  };

  // Theme modifications
  const updateTheme = (newSettings: Partial<AppThemeConfig>) => {
    setTheme(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // News additions with Supabase write-through
  const addNews = async (newsData: Omit<SchoolNews, 'id' | 'date'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const item: SchoolNews = {
      ...newsData,
      id: `NEW-${Math.floor(100 + Math.random() * 900)}`,
      date: todayStr
    };
    setNews(prev => [item, ...prev]);
    
    try {
      await supabase.from('news').insert([mapNewsToDb(item)]);
    } catch (e) {
      console.error('Error adding news to Supabase:', e);
    }
  };

  const changeTeacherPassword = async (id: string, newPass: string) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, password: newPass, si_pass: false } : t));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, si_pass: false } : null);
    }
    try {
      const teacherObj = teachers.find(t => t.id === id);
      if (teacherObj) {
        const updatedTeacher = { ...teacherObj, password: newPass, si_pass: false };
        await supabase.from('teachers').update(mapTeacherToDb(updatedTeacher)).eq('id', id);
      }
    } catch (e) {
      console.error('Error updating password in Supabase:', e);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      logout,
      changeTeacherPassword,
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      teachers,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      resources,
      addResource,
      deleteResource,
      transactions,
      addTransaction,
      balance,
      attendance,
      registerAttendance,
      theme,
      updateTheme,
      news,
      addNews
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
